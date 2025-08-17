// src/features/posts/components/CreatePost.jsx
import { useState } from 'react';
import { Button, Input } from '../../../components/common';
import { useAuth } from '../../../features/auth';
import { toast } from 'react-toastify';
import { postService } from '../services/postService';

const CreatePost = () => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [files, setFiles] = useState([]);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledTime, setScheduledTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreatePost = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('pageId', user.pageId);
            formData.append('content', content);

            if (files.length > 0) {
                Array.from(files).forEach(file => {
                    formData.append('media', file);
                });
            }

            if (isScheduled && scheduledTime) {
                formData.append('scheduledTime', scheduledTime);
            }

         await postService.createPost(formData);

            toast.success(isScheduled ? 'Đã lên lịch đăng bài!' : 'Đăng bài thành công!');

            setContent('');
            setFiles([]);
            setScheduledTime('');
            setIsScheduled(false);

        } catch (error) {
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <Input
                type="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung bài đăng..."
                className="w-full mb-4"
            />

            <div className="mb-4">
                <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    accept="image/*,video/*"
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                >
                    Thêm ảnh/video
                </label>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="form-checkbox"
                    />
                    <span>Lên lịch đăng bài</span>
                </label>

                {isScheduled && (
                    <Input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-48"
                    />
                )}
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {Array.from(files).map((file, index) => (
                        <div key={index} className="relative">
                            {file.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            ) : (
                                <video
                                    src={URL.createObjectURL(file)}
                                    controls
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            )}
                            <button
                                onClick={() => {
                                    const newFiles = Array.from(files);
                                    newFiles.splice(index, 1);
                                    setFiles(newFiles);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Button
                onClick={handleCreatePost}
                disabled={
                    loading ||
                    (!content.trim() && !files.length) ||
                    (isScheduled && !scheduledTime)
                }
                loading={loading}
                className="w-full"
            >
                {loading ? 'Đang xử lý...' : (isScheduled ? 'Lên lịch đăng' : 'Đăng ngay')}
            </Button>
        </div>
    );
};

export default CreatePost;