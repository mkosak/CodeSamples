import React from 'react';
import PropTypes from 'prop-types';
import {
    Icon, IconArrowDown, IconArrowUp, IconExpand,
} from 'design-system';

export default function SortHandler(props) {
    const { sortMethod, sortBy, activeSort } = props;
    
    // set if this sort handler is active
    const isActiveSort = activeSort && activeSort.method === sortMethod;
    const sortIcon = isActiveSort && activeSort.order === 'ASC' ? IconArrowDown : IconArrowUp;
    const sortDirection = isActiveSort && activeSort.order === 'ASC' ? 'DESC' : 'ASC';

    const icon = () =>
        // if this instance is active, show icons according sort order
        // otherwise icon that represent not active sort handler
        (
            <span className="sort-handler" onClick={() => { sortBy(sortMethod, isActiveSort ? sortDirection : 'ASC'); }}>
                <Icon InlineIcon={isActiveSort ? sortIcon : IconExpand} />
            </span>
        );
    return icon();
}

SortHandler.propTypes = {
    // sort method name or alias for this instance
    sortMethod: PropTypes.string.isRequired,
    // function that perform sorting with given method and direction
    sortBy: PropTypes.func.isRequired,
    // object contain current active sort method and direction
    activeSort: PropTypes.shape({
        method: PropTypes.string,
        order: PropTypes.string,
    }),
};
