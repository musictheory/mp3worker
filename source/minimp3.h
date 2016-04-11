#ifndef __MINIMP3_H_INCLUDED__
#define __MINIMP3_H_INCLUDED__

typedef struct {
    void *output_buffer;
    int   output_length;
    int   nb_channels;
    int   sample_rate;
} mp3_context;

extern mp3_context *mp3_create(const void *inBytes, int inLength);

void mp3_decode(mp3_context *inContext);

#endif//__MINIMP3_H_INCLUDED__
