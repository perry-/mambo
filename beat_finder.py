# Beat tracking example
from __future__ import print_function
import librosa

import pyglet


import time
from threading import Thread

def playsong(filename):
	print('Playing song')
	song = pyglet.media.load(filename)
	song.play()
	print('Playing')


	pyglet.app.run()
	print('Running')


def sending(count):
	print('Beat ', count)


def main():
	starting_main_time = time.time()
	print("Loading song...")
    # 1. Get the file path to the included audio example
	# filename = librosa.util.example_audio_file()
	filename = './movesLikeJagger2.wav'
	#filename = '../Downloads/03.wav'

	# 2. Load the audio as a waveform `y`
	#    Store the sampling rate as `sr`
	y, sr = librosa.load(filename)

	# 3. Run the default beat tracker
	tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)

	#print('Estimated tempo: {:.2f} beats per minute'.format(tempo))

	# 4. Convert the frame indices of beat events into timestamps
	beat_times = librosa.frames_to_time(beat_frames, sr=sr)

	#print('Saving output to beat_times.csv')
	#librosa.output.times_csv('beat_times.csv', beat_times)
	
	print('Loaded song in ', (time.time() - starting_main_time), ' seconds')

	t = Thread(target=playsong, args=(filename,))
	print("Starting playsong() thread")
	t.start()

	print("Start beat :", time.ctime())

	counter=0
	for i in beat_times:
		#print('Sleeping: ', i)
		time.sleep(i)
		sending(counter)
		counter+=1

	print("Ended at : ", time.ctime(), ' ran for ', (time.time()-starting_main_time), ' seconds')


if __name__=='__main__':
	main()