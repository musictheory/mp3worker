#import <Foundation/Foundation.h>

#include "mp3worker.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSData *data = [NSData dataWithContentsOfFile:@"/Users/iccir/Desktop/mono.mp3"];
        const void   *mp3Bytes  = [data bytes];
        size_t  mp3Length = [data length];

        mp3_context *context = mp3_init();
        
        int offset = 0;
        
        while (1) {
            int lengthToCopy = (int)MIN(
                mp3Length - offset,
                context->input_max_length
            );

            //mp3_context->input_buffer
            
            memcpy(context->input_buffer, mp3Bytes + offset, lengthToCopy);
            
            NSLog(@"%ld, %ld", (long)offset, (long)lengthToCopy);
            
            context->input_length = lengthToCopy;
            mp3_decode();
            
            NSLog(@"%ld %ld %ld", (long)context->output_length, (long)context->sample_rate, (long)context->nb_channels);
            
            offset += context->input_used_length;
            
            if (context->output_length == 0) {
                break;
            }
        }
    }

    return 0;
}
