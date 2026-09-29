import { useEffect, useState } from 'react';
import profileIcon from '@/assets/icons/profile.svg';

interface ProfileAvatarProps {
  imageUrl?: string;
  alt: string;
  className?: string;
}

/** 프로필 이미지가 없거나 불러오기에 실패하면 기본 프로필 아이콘을 표시합니다. */
export default function ProfileAvatar({ imageUrl, alt, className }: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <img
      src={imageUrl && !imageError ? imageUrl : profileIcon}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
