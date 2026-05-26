export function formatTrack(t) {
  return {
    id: `telegram:${t.trackId}`,
    trackId: t.trackId,
    title: t.title || 'Unknown Track',
    artist: t.artist || 'Unknown Artist',
    album: t.album || null,
    duration: t.duration || 0,
    artworkPath: t.artworkPath || null,
    provider: 'telegram',
  };
}
