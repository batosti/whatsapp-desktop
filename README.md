# Whatsapp Desktop

Whatsapp client made with electron and whatsapp web

## Setup

`npm install`

# Run 

`npm run start`

# Package

`npm run dist` builds the snap (needs `snapcraft` and LXD). Use `npx electron-builder --linux deb` for a `.deb`.

`npm run dist`

## Packages

![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)(https://snapcraft.io/whatsapp-electron)

### Microphone and camera (voice notes, calls)

The snap declares the `audio-record` and `camera` interfaces, but snapd does not connect them automatically. Connect them once after installing:

```
sudo snap connect whatsapp-electron:audio-record
sudo snap connect whatsapp-electron:camera
```

Then restart the app. You can check the connections with `snap connections whatsapp-electron`.

## Support this project

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png)](https://www.buymeacoffee.com/batosti)