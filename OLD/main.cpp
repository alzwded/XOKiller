#include <SDL/SDL.h>
#include <assert.h>

SDL_Surface* g_window = NULL;
unsigned char g_tick = 0;

static SDLCALL Uint32 on_timer(Uint32 interval)
{
    ++g_tick;
    return interval;
}

int main()
{
    int hr = SDL_Init(SDL_INIT_TIMER 
            | SDL_INIT_AUDIO
            | SDL_INIT_VIDEO
            | SDL_INIT_JOYSTICK);
    assert(hr == 0);

    g_window = SDL_SetVideoMode(
            640,
            480,
            16,
            SDL_DOUBLEBUF | SDL_HWSURFACE);
    SDL_WM_SetCaption("zombie hell", "zombie hell");
    SDL_SetTimer(17, &on_timer);

    struct {
        struct {
            int fire, alt, start, toggle;
        } joystick_mapping;
        int joystickid;
    } realdata, *data = &realdata;

    unsigned char tick = g_tick;
    bool loop = true;
    while(loop)
    {
        SDL_Event event;
        int current_input;
        while(SDL_PollEvent(&event)) {
            switch(event.type) {
            case SDL_QUIT:
                loop = 0;
                break;
            case SDL_KEYDOWN:{
                if(event.key.keysym.sym == SDLK_ESCAPE){
                    loop = 0;
                }
                break; }
            case SDL_JOYAXISMOTION: {
                if(event.jaxis.which == data->joystickid) {
                    int value = event.jaxis.value;
                    int axis = event.jaxis.axis;
                }
                break; }
            case SDL_JOYHATMOTION: {
                if(event.jhat.which == data->joystickid) {
                    unsigned value = event.jhat.value;
                    int hat = event.jhat.hat;
                }
                break; }
            case SDL_JOYBUTTONDOWN: {
                unsigned which = event.jbutton.which;
                if(event.jbutton.which == data->joystickid) {
                    int value = event.jbutton.button;

#define LGE_FIRE 1
#define LGE_ALT 2
#define LGE_START 4
#define LGE_TOGGLE 8
                    if(value == data->joystick_mapping.fire) {
                        current_input |= LGE_FIRE;
                    } else if(value == data->joystick_mapping.alt) {
                        current_input |= LGE_ALT;
                    } else if(value == data->joystick_mapping.start) {
                        current_input |= LGE_START;
                    } else if(value == data->joystick_mapping.toggle) {
                        current_input |= LGE_TOGGLE;
                    }
                }
                break; }
            }
        }

        if(tick != g_tick)
        {
            SDL_Flip(g_window);
            tick = g_tick;
        }
    }

    SDL_SetTimer(0, NULL);
    SDL_Quit();

    return 0;
}
