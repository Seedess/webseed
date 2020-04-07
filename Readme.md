# Seedess Webseed Server

A P2P Video Streaming BitTorrent Server

## WebSeed

Webseed allows a BitTorrent network to serve files from a server

## Private BitTorrent Networks

A Private BitTorrent Network allows companies to leverage the BitTorrent technology in a secure, private closed network to distribute video to their viewers

## Intoduction

Seedess WebSeed Server streams videos into your private bittorrent network. 

Traditional BitTorrent is only as effective as the number of "seeds" (peers sharing files) into the network thus not feasible for corporate video streamin networks. 

Seedess creates a network where video files are always available and streamed from the fastest source. That source is usually another viewer (peer) or a CDN (cloudflare, amazon, google cloud etc.) or a cached copy on your server.

This effectively creates an efficient and secure video streaming network topology while reducing your video streaming bandwidth by up to 70%. 

## Reducing video streaming bandwidth by 70%

The major portion of the video streaming is done over P2P (since it is faster) while the initial connections are made to your video streaming server or CDN to seed or flood the network with the video stream. 

Imagine there are 1000 simultaneous viewers of your 4K video. Traditionally you would have 1000 streams to your video streaming server. This would be very inefficient and costly. By using BitTorrent for 70% of the videos, you would only be streaming to 300 viewers. This is efficient and cost effective in comparison.

## Install

Node.js is required on the server

``
git clone git@github.com:Seedess/webseed.git
cd webseed
``

## Start

``
npm start
``