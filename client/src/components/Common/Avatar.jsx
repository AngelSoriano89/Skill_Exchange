// ========================================
// client/src/components/Common/Avatar.jsx
// Componente opcional para manejar avatares con fallbacks
// ========================================

// import React, { useState, useEffect } from 'react';

// const Avatar = ({ 
//   user, 
//   size = 'w-10 h-10', 
//   className = '', 
//   fallbackBg = 'from-primary-500 to-primary-700' 
// }) => {
//   const [imageError, setImageError] = useState(false);
//   const [imageLoading, setImageLoading] = useState(true);

//   const getAvatarUrl = (avatarPath) => {
//     if (!avatarPath) return null;
//     if (avatarPath.startsWith('http')) return avatarPath;
    
//     // ✅ USAR: Ruta directa al servidor backend
//     const baseUrl = process.env.NODE_ENV === 'production' 
//       ? window.location.origin 
//       : 'http://localhost:5000';
    
//     return `${baseUrl}${avatarPath}`;
//   };

//   const avatarUrl = user?.avatar ? getAvatarUrl(user.avatar) : null;
//   const userName = user?.name || 'Usuario';
//   const userInitial = userName.charAt(0).toUpperCase();

//   // Reset error state cuando cambia el usuario
//   useEffect(() => {
//     if (avatarUrl) {
//       setImageError(false);
//       setImageLoading(true);
//     }
//   }, [avatarUrl]);

//   const handleImageLoad = () => {
//     setImageLoading(false);
//   };

//   const handleImageError = () => {
//     console.warn(`Error cargando avatar: ${avatarUrl}`);
//     setImageError(true);
//     setImageLoading(false);
//   };

//   // Si no hay avatar URL o hay error, mostrar fallback
//   if (!avatarUrl || imageError) {
//     return (
//       <div className={`${size} bg-gradient-to-br ${fallbackBg} rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}>
//         {userInitial}
//       </div>
//     );
//   }

//   return (
//     <div className={`${size} relative ${className}`}>
//       {/* Mostrar skeleton mientras carga */}
//       {imageLoading && (
//         <div className={`${size} bg-gray-200 animate-pulse rounded-full absolute inset-0`}></div>
//       )}
      
//       {/* Imagen del avatar */}
//       <img
//         src={avatarUrl}
//         alt={`Avatar de ${userName}`}
//         className={`${size} rounded-full object-cover border-2 border-white shadow-md ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
//         onLoad={handleImageLoad}
//         onError={handleImageError}
//         crossOrigin="anonymous" // ✅ IMPORTANTE: Para CORS
//       />
//     </div>
//   );
// };

// export default Avatar;

// ========================================
// USO DEL COMPONENTE:
// ========================================

// En lugar de:
// renderAvatarWithFallback(user)

// Usar:
// <Avatar user={user} size="w-20 h-20" />

// ========================================
// EJEMPLO EN UserCard.jsx:
// ========================================

// import Avatar from '../Common/Avatar';

// const UserCard = ({ user }) => {
//   return (
//     <div className="card">
//       <div className="text-center mb-4">
//         <Avatar 
//           user={user} 
//           size="w-20 h-20" 
//           className="mx-auto mb-4"
//         />
//         <h3 className="text-lg font-bold">{user.name}</h3>
//         {/* resto del componente */}
//       </div>
//     </div>
//   );
// };
