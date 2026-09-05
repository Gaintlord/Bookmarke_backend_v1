export const getYtVideoID = (videoLink: string) => {
  const vIdPatt: RegExp = /(?<=watch\?v=)([^&]+)/;
  const videoID = videoLink.match(vIdPatt);
  return videoID?.[0];
};
