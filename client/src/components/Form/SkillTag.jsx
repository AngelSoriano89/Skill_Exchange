import React from 'react';

const SkillTag = ({ skill }) => {
  return (
    <span className="badge bg-primary text-wrap me-2 mb-2 p-2">
      {skill}
    </span>
  );
};

export default SkillTag;
