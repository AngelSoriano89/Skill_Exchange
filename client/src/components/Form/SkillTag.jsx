import React from 'react';

const SkillTag = ({ skill }) => {
  return (
    <span className="bg-blue-200 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full mb-2">
      {skill}
    </span>
  );
};

export default SkillTag;
