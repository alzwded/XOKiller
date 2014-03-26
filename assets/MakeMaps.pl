#!/usr/bin/perl -w

open A, "<map.idx";
open F, ">mapdata.js";

print F "var __mapdata = new Array()\n";

while(<A>) {
    print F "__mapdata.push(new Array(\n";
    chomp;
    my $mapName = $_;
    open (my $map, $mapName);

    while(<$map>) {
        chomp;
        my $line = $_;
        print F "  '$_',\n";
    }

    print F "''))\n";

    close $map;
}

close F;
close A;
