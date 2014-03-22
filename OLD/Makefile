CPP = g++
CFLAGS = -g -c `pkg-config --cflags sdl`
EXTRAFLAGS = 
LD = g++
LDARGS = `pkg-config --libs sdl`

OBJS = main.o

zombieHell: $(OBJS)
	$(LD) -o zombieHell $(OBJS) $(LDARGS)

%.o: %.cpp
	$(CPP) -o $@ $(CFLAGS) $(EXTRAFLAGS) $<

clean:
	rm -f $(OBJS) zombieHell
