#
# Makefile: kaku.c
#	
#
#	Copyright (c) 2012 Hans Klunder
#################################################################################
#    kaku.c  is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    wiringPi is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with wiringPi.  If not, see <http://www.gnu.org/licenses/>.
#################################################################################


#DEBUG	= -g -O0
DEBUG	= -O3
CC	= gcc
INCLUDE	= -I/usr/local/include
CFLAGS	= $(DEBUG) -Wall $(INCLUDE) -Winline -pipe

LDFLAGS	= -L/usr/local/lib
LDLIBS    = -lwiringPi

DESTDIR=/usr
PREFIX=/local

# Should not alter anything below this line
###############################################################################

SRC	=	kaku.c

OBJ	=	$(SRC:.c=.o)

BINS	=	$(SRC:.c=)

all:	
	@echo "    $(BINS)" | fmt
	@echo ""

kaku:	kaku.o
	@echo [link] $<
	@$(CC) -o $@ kaku.o $(LDFLAGS) $(LDLIBS)

.c.o:
	@echo [Compile] $<
	@$(CC) -c $(CFLAGS) $< -o $@

clean:
	rm -f $(OBJ) *~ core tags $(BINS)

tags:	$(SRC)
	@echo [ctags]
	@ctags $(SRC)

depend:
	makedepend -Y $(SRC)

install:
	@echo "[Install]"
	@cp kaku /usr/local/bin
	@chown root.root /usr/local/bin/kaku
	@chmod 4755 /usr/local/bin/kaku

# DO NOT DELETE
