"""!
@brief Example 02
@details Example of spectrogram computation for a wav file, using only scipy
@author Theodoros Giannakopoulos {tyiannak@gmail.com}
"""
import scipy.fftpack as scp
import numpy as np
import scipy.io.wavfile as wavfile
import plotly
import plotly.graph_objs as go
from pydub import AudioSegment
import os
import pandas as pd
import plotly.express as px
import glob

'''
https://gist.github.com/arjunsharma97/0ecac61da2937ec52baf61af1aa1b759
'''
def m4_to_wav(filename):
    (path, file_extension) = os.path.splitext(filename)
    file_extension_final = file_extension.replace('.', '')
    try:
        track = AudioSegment.from_file(filename,
                                       file_extension_final)
        wav_filepath = filename.replace(file_extension_final, 'wav')
        print('CONVERTING: ' + str(wav_filepath))
        file_handle = track.export(wav_filepath, format='wav')
        # os.remove(filepath)
    except Exception:
        print('Error with ' + filename)
    return wav_filepath


'''
https://github.com/tyiannak/multimodalAnalysis/blob/master/audio/example02.py
'''
def get_fft_spec(signal, fs, win):
    frame_size, signal_len, spec, times = int(win * fs), len(signal), [], []
    # break signal into non-overlapping short-term windows (frames)
    frames = np.array([signal[x:x + frame_size] for x in
                       np.arange(0, signal_len - frame_size, frame_size)])
    for i_f, f in enumerate(frames): # for each frame
        times.append(i_f * win)
        # append mag of fft
        X = np.abs(scp.fft(f)) ** 2
        freqs = np.arange(0, 1, 1.0/len(X)) * (fs/2)
        spec.append(X[0:int(len(X) / 2)] / X.max())
    freqs = freqs[:int(freqs.shape[0] / 2)]
    return np.array(spec).T, freqs, times


def graph_fft(filename, reload=True):
    layout = go.Layout(title='Spectrogram ' + filename,
                       xaxis=dict(title='time (sec)', ),
                       yaxis=dict(title='Freqs (Hz)', ))

    (pre_extention, extention) = os.path.splitext(filename)
    spectrum_filename = pre_extention + '_S.npy'
    frequency_filename = pre_extention + '_f.npy'
    time_filename = pre_extention + '_t.npy'

    if reload:
        [Fs, s] = wavfile.read(filename)
        S, f, t = get_fft_spec(s, Fs, 0.02)
        S = np.nan_to_num(S)

        np.save(spectrum_filename, S)
        np.save(frequency_filename, f)
        np.save(time_filename, t)
    else:
        S = np.load(spectrum_filename)
        f = np.load(frequency_filename)
        t = np.load(time_filename)

    # print(len(t))
    magnitude_means = np.median(S, axis=1)
    magnitude_means = magnitude_means / np.linalg.norm(magnitude_means)
    df_data = np.array([f, magnitude_means]).T
    # print(df_data.shape)
    # exit(0)
    freq_hist = pd.DataFrame(data=df_data, columns=['freqs', 'means'])
    fig = go.Figure([go.Bar(x=freq_hist['freqs'],
                            y=freq_hist['means'])],
                    layout=dict(title=filename))
    fig.update_yaxes(range=[0, 1])
    fig.show()
    # exit(0)
    # heatmap = go.Heatmap(z=S, y=f, x=t)
    # plotly.offline.plot(go.Figure(data=[heatmap], layout=layout),
    #                     filename="temp.html", auto_open=True)

if __name__ == '__main__':
    filenames = glob.glob('audio/*.m4a')
    for filename in filenames:
        wav_filename = m4_to_wav(filename)
        graph_fft(wav_filename)

