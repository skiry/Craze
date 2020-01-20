import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

const FilterGroup = (props) => {
  const { tags, selectedFilteringTags, handleTagClick } = props;
  const colors = [
                    '#f2f2f2',
                    '#42a02d',
                    '#ae342c'
                 ]
  return (
    <ToggleButtonGroup value={selectedFilteringTags} onChange={handleTagClick}>
      {tags.map((tag, index) =>
          <ToggleButton key={tag} value={tag} style={{
                                            fontWeight: 'bold',
                                            color: '#3f4345',
                                            margin: '3px', 
                                            height: '60px', 
                                            background: colors[props.tagsClicked[index]]
                                          }} 
          >
              {tag}
          </ToggleButton>)
      }
    </ToggleButtonGroup>
  );
};

export default FilterGroup;