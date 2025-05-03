import React, { useEffect, useRef } from 'react';
import Header from '../../../components/Header';

const VideoPlayback: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const videoUrl = 'https://amr146.github.io/videos/Beach.mp4';
	const STORAGE_KEY = 'video-playback-time';

	// Save current time to sessionStorage periodically
	useEffect(() => {
		if (localStorage.getItem('forceLogout') === 'true') return;

		const video = videoRef.current;

		const handleTimeUpdate = () => {
			if (video) {
				sessionStorage.setItem(STORAGE_KEY, video.currentTime.toString());
			}
		};

		video?.addEventListener('timeupdate', handleTimeUpdate);

		return () => {
			video?.removeEventListener('timeupdate', handleTimeUpdate);
		};
	}, []);

	// Restore playback time from sessionStorage
	useEffect(() => {
		const savedTime = sessionStorage.getItem(STORAGE_KEY);
		if (savedTime && videoRef.current) {
			videoRef.current.currentTime = parseFloat(savedTime);
		}
	}, []);

	return (
		<>
			<Header />
			<div className='flex items-center justify-center min-h-screen bg-gray-100'>
				<div className='w-full max-w-4xl p-4 bg-white shadow-lg rounded-lg'>
					<h2 className='mb-4 text-2xl font-bold text-center text-gray-700'>
						Video Playback
					</h2>
					<video
						ref={videoRef}
						src={videoUrl}
						controls
						autoPlay
						className='w-full rounded-lg shadow-md'
					>
						Your browser does not support the video tag.
					</video>
				</div>
			</div>
		</>
	);
};

export default VideoPlayback;
