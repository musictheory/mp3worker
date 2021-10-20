#ifndef mp3worker_h
#define mp3worker_h

#include <stdio.h>

typedef struct {
    // Buffers
    void *input_buffer;         // 0
    int   input_max_length;     // 1

    void *output_buffer;        // 2
    int   output_max_length;    // 3

    // Input
    int   input_length;         // 4

    // Output
    int   output_length;        // 5
    int   input_used_length;    // 6
    int   nb_channels;          // 7
    int   sample_rate;          // 8
} mp3_context;

extern mp3_context *mp3_init(void);

void mp3_decode(void);

#endif /* mp3worker_h */
