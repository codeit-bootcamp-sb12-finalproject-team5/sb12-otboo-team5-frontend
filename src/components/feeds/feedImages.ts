import type { FeedDto, OotdDto } from '@/lib/api/types';

type FeedImage = Pick<OotdDto, 'name' | 'imageUrl' | 'attributes'> & { key: string };

export function getFeedImages(feed: FeedDto): FeedImage[] {
  const clothes = feed.ootds.map(ootd => ({ ...ootd, key: `clothes:${ootd.clothesId}` }));
  return feed.imageUrl
    ? [{ key: `feed:${feed.id}`, name: '아웃핏 이미지', imageUrl: feed.imageUrl, attributes: [] }, ...clothes]
    : clothes;
}
