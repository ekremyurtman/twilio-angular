import { Component, ElementRef, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { createLocalVideoTrack, LocalVideoTrack } from 'twilio-video';
import * as VideoProcessors from '@twilio/video-processors';

@Component({
    selector: 'app-camera',
    styleUrls: ['./camera.component.css'],
    templateUrl: './camera.component.html',
})

export class CameraComponent implements AfterViewInit {
  @ViewChild('preview', { static: false }) previewElement: ElementRef;

  isInitializing: boolean = true;
  private videoTrack: LocalVideoTrack;

  constructor(private readonly renderer: Renderer2) { }

  async ngAfterViewInit() {
      if (this.previewElement && this.previewElement.nativeElement) {
          await this.initializeDevice();
      }
  }

  async initializePreview(deviceId: string) {
      await this.initializeDevice(deviceId);
  }

  finalizePreview() {
      try {
          if (this.videoTrack) {
              this.videoTrack.detach().forEach(element => element.remove());
          }
          //this.videoTrack = null;
      } catch (e) {
          console.error(e);
      }
  }

  private async initializeDevice(deviceId?: string) {
      try {
          this.isInitializing = true;

          this.finalizePreview();

          this.videoTrack = deviceId
              ? await createLocalVideoTrack({ deviceId })
              : await createLocalVideoTrack({ facingMode: 'user' });

              if (VideoProcessors.isSupported) {
                let img = new Image();
                img.src = '/assets/background.jpg';
                img.onload = async () => {
                    const bg = new VideoProcessors.VirtualBackgroundProcessor({
                        assetsPath: '/assets',
                        backgroundImage: img,
                        maskBlurRadius: 5
                    });
                    await bg.loadModel();
                    this.videoTrack.addProcessor(bg);
                }

                /* Please uncomment the following code blocks, if you want to use blur background */

                // const bg = new VideoProcessors.GaussianBlurBackgroundProcessor({
                //    assetsPath: '/assets',
                //    maskBlurRadius: 10,
                //    blurFilterRadius: 5,
                // });
                // await bg.loadModel();
                // this.videoTrack.addProcessor(bg);
            }

          const videoElement = this.videoTrack.attach();
          this.renderer.setStyle(videoElement, 'width', '100%');
          this.renderer.appendChild(this.previewElement.nativeElement, videoElement);
      } finally {
          this.isInitializing = false;
      }
  }
}