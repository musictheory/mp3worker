#include "mp3worker.h"

#define MINIMP3_ONLY_MP3
#define MINIMP3_NO_SIMD
#define MINIMP3_FLOAT_OUTPUT
#define MINIMP3_IMPLEMENTATION
#include "minimp3.h"

static mp3_context sContext;

static uint8_t sInput[MAX_FREE_FORMAT_FRAME_SIZE];
static mp3d_sample_t sOutput[MINIMP3_MAX_SAMPLES_PER_FRAME];

static mp3dec_t sMP3D;
static mp3dec_frame_info_t sFrameInfo;


mp3_context *mp3_init()
{
    mp3dec_init(&sMP3D);

    sContext.input_buffer = sInput;
    sContext.input_max_length = MAX_FREE_FORMAT_FRAME_SIZE;

    sContext.output_buffer = sOutput;
    sContext.output_max_length = MINIMP3_MAX_SAMPLES_PER_FRAME * sizeof(mp3d_sample_t);

    sContext.input_length = 0;

    sContext.output_length = 0;
    sContext.input_used_length = 0;
    sContext.nb_channels = 0;
    sContext.sample_rate = 0;
    
    return (mp3_context *)&sContext;
}


void mp3_decode()
{
    int samples = mp3dec_decode_frame(&sMP3D, sInput, sContext.input_length, sOutput, &sFrameInfo);

    sContext.input_used_length = sFrameInfo.frame_bytes;

    sContext.output_length = samples;
    sContext.nb_channels = sFrameInfo.channels;
    sContext.sample_rate = sFrameInfo.hz;
}

