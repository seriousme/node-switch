
/*
 * kaku.c:
 *	Simple program to  control klik-aan-klik-uit power devices
 */

#include <wiringPi.h>

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <unistd.h>

#define _periodusec 375
#define _repeats 4
#define on True
#define off False

typedef enum {False=0, True} boolean;
typedef unsigned char byte; 

 /*
 
  */
 
 static void display_usage(const char *cmd)
 {
	fprintf(stderr, "Usage: %s [-g group] [-n deviceid] [-d gpio-device] on|off\n\n", cmd);
	fprintf(stderr, "  -g     Group (default A), default is group A\n");
	fprintf(stderr, "  -h     Display usage information (this message)\n");
	fprintf(stderr, "  -n     Deviceid (default 1), default is device 1\n");
	fprintf(stderr, "  -p     Gpio-pin (default pin 7)\n");
	fprintf(stderr, "  on|off Action requested (default off)\n");
	fprintf(stderr,	"\nExamples: ");
	fprintf(stderr,	"\n%s -g A -n 1 -p 7 on\n", cmd);
	fprintf(stderr,	"\n%s -g A -n 1 off\n", cmd);
 }
 
void sendTrit(int pin,byte trit) {
 	switch (trit) {
 		case 0:
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec*3);
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec*3);
			break;
		case 1:
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec*3);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec);
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec*3);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec);
			break;
		case 2: //AKA: X or float
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec*3);
			digitalWrite(pin,HIGH);
			delayMicroseconds(_periodusec*3);
			digitalWrite(pin,LOW);
			delayMicroseconds(_periodusec);
			break;
 	}
 }
 
 void sendTelegram(int pin,byte trits[]) {
	byte i;
	byte j;
 	for (i=0;i<_repeats;i++) {		
 		//Send data. Always 12 trits.
 		for (j=0;j<12;j++) {
 			sendTrit(pin,trits[j]);
 		}

 		//Send termination/synchronisation-signal. Total length: 32 periods
 		digitalWrite(pin,HIGH);
 		delayMicroseconds(_periodusec);
 		digitalWrite(pin,LOW);
 		delayMicroseconds(_periodusec*31);
 	}
 }
 
 void sendSignal(int pin, char address, byte device, boolean on) {
 	byte trits[12];
 	byte i;
 	
 	address-=65;
 	device-=1;
	printf("sendsignal: address %d, Device %d, action %d\n",address,device,(on?2:0));
 	
 	for (i=0; i<4; i++) {
 		//bits 0-3 contain address (2^4 = 16 addresses)
 		trits[i]=(address & 1)?2:0;          
 		address=address>>1;
 		
 		//bits 4-8 contain device (2^4 = 16 addresses)
 		trits[i+4]=(device & 1)?2:0;          
 		device=device>>1;
     }
 	
 	//bits 8-10 seem to be fixed
 	trits[8]=0;
 	trits[9]=2;
 	trits[10]=2;
 	
 	//switch on or off
 	trits[11]=(on?2:0);
 	
 	sendTelegram(pin,trits);
 }
 
 
 int main(int argc, char **argv)
 {
	int pin = 7;
	char switch_group = 'A';
	byte switch_dev = 1;
	boolean action = off;
	int n=0;
	int m=0;

	if (argc < 2){
		display_usage(argv[0]);
		return 1;
	}	
	
	while (1) {
		int c;
		c = getopt(argc, argv, "g:hn:p:?");
		if (c == -1)
			break;
		switch (c) {
		case 'g':
			switch_group = optarg[0];
			break;
		case 'n':
			sscanf(optarg,"%d", &n );
			switch_dev=n;
			break;
		case 'p':
			sscanf(optarg,"%d", &m );
			pin=m;
			break;
		case 'h':
		case '?':
			display_usage(argv[0]);
			return 1;
		default:
			abort();
		}
	}
	if (optind < argc) /*even checken of er on staat ! */
		if ( ! strcmp(argv[optind++],"on"))
			action=on;
	
  	if (wiringPiSetup () == -1)
    		exit (1) ;

    	pinMode (pin, OUTPUT) ;

	printf("Group %c\nDevice %d\naction %s\n",switch_group,switch_dev,(action?"on":"off"));
	
	sendSignal(pin,switch_group,switch_dev,action);
	
	return 0;
 }
