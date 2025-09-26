import React, { useState, useEffect } from 'react';
import { buildAvatarUrl } from '../../api/api';

const Avatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  fallbackBg = 'from-blue-500 to-purple-600',
  onClick = null,
  showBorder = true,
  showShadow = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Mapeo de tamaños
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-3xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  const cacheKey = user?.updatedAt || user?.date || user?._id || '';
  const avatarUrl = user?.avatar ? buildAvatarUrl(user.avatar, cacheKey) : null;
  const userName = user?.name || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  // Reset error state cuando cambia el usuario
  useEffect(() => {
    if (avatarUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [avatarUrl, user?.id]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    console.warn(`Error cargando avatar: ${avatarUrl}`);
    setImageError(true);
    setImageLoading(false);
  };

  const baseClasses = `
    ${sizeClass} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-bold 
    transition-all 
    duration-200
    ${showBorder ? 'border-2 border-white' : ''}
    ${showShadow ? 'shadow-md' : ''}
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Si no hay avatar URL o hay error, mostrar fallback
  if (!avatarUrl || imageError) {
    return (
      <div 
        className={`${baseClasses} bg-gradient-to-br ${fallbackBg} text-white`}
        onClick={onClick}
        title={userName}
      >
        {userInitial}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} relative overflow-hidden`} onClick={onClick}>
      {/* Mostrar skeleton mientras carga */}
      {imageLoading && (
        <div className={`${sizeClass} bg-gray-200 animate-pulse rounded-full absolute inset-0`} />
      )}
      
      {/* Imagen del avatar */}
      <img
        src={avatarUrl}
        alt={`Avatar de ${userName}`}
        className={`
          ${sizeClass} 
          rounded-full 
          object-cover 
          ${imageLoading ? 'opacity-0' : 'opacity-100'} 
          transition-opacity 
          duration-200
        `}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    </div>
  );
};

// Componente AvatarGroup para mostrar múltiples avatares
export const AvatarGroup = ({ users = [], maxVisible = 3, size = 'md', className = '' }) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleUsers.map((user, index) => (
        <Avatar
          key={user.id || index}
          user={user}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      
      {remainingCount > 0 && (
        <div className={`
          ${sizeClass} 
          bg-gray-100 
          text-gray-600 
          rounded-full 
          flex 
          items-center 
          justify-center 
          font-medium 
          ring-2 
          ring-white
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
