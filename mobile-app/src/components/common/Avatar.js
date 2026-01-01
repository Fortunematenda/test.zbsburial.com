import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Avatar = ({ imageUri, firstName, lastName, size = 80 }) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`.trim() || '?';
  };

  // Calculate font size based on avatar size
  const fontSize = size * 0.4;

  // Reset error state when imageUri changes
  useEffect(() => {
    setImageError(false);
  }, [imageUri]);

  if (imageUri && !imageError) {
    return (
      <Image
        key={imageUri}
        source={{ uri: imageUri }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        resizeMode="cover"
        onError={(error) => {
          console.log('Avatar image load error:', error);
          setImageError(true);
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarPlaceholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            fontSize: fontSize,
          },
        ]}
      >
        {getInitials()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#E8E2FF',
  },
  avatarPlaceholder: {
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Avatar;
