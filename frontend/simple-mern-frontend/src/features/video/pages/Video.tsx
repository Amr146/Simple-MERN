import React from 'react';
import Header from '../../../components/Header';

const VideoPlayback: React.FC = () => {
	// Hardcoded video URL
	const videoUrl =
		'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

	return (
		<>
			<Header />
			<div className='flex items-center justify-center min-h-screen bg-gray-100'>
				<div className='w-full max-w-4xl p-4 bg-white shadow-lg rounded-lg'>
					<h2 className='mb-4 text-2xl font-bold text-center text-gray-700'>
						Video Playback
					</h2>
					<video
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
