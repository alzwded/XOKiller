#!/usr/bin/perl -w

open A, "<map.idx";
open F, ">mapdata.js";

print F "var __mapdata = new Array()\n";

while(<A>) {
    print F "__mapdata.push(new Array(\n";
    chomp;
    open (my $map, $_) or die("cannot $_");

    while(<$map>) {
        chomp;
        print F "  '$_',\n";
    }

    print F "''))\n";

    close $map;
}

close F;
close A;
