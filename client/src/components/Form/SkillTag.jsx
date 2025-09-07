import React from 'react';

const SkillTag = ({ skill, color = 'primary' }) => {
  const badgeClasses = `badge bg-${color} text-wrap me-2 mb-2 p-2`;
  return (
    <span className={badgeClasses}>
      {skill}
    </span>
  );
};

export default SkillTag;
