#!/usr/bin/perl -w

open A, "<map.idx" or die 'cannot read map.idx';
open F, ">mapdata.js" or die 'cannot open mapdata.js';

print F "var __mapdata = new Array()\n" or die 'cannot write mapdata.js';

while(<A>) {
    chomp;
    open (my $map, $_) or die("cannot $_");
    print F "__mapdata.push(new Array(\n";

    while(<$map>) {
        chomp;
        print F "  '$_',\n";
    }

    print F "''))\n";

    close $map;
}

close F;
close A;
