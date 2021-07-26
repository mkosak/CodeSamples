import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Heading } from 'design-system';
import CapacityTable from './CapacityTable/';
import { TranslateContext } from '../System/Translations';

import './styles.scss';

export default function Capacity(props) {
  const { 
    meta, 
    timeline,
    rides,
    fetchTimeline,
    rideStatus,
    notify 
  } = props;

  const { from, to } = meta;
  const { line_variation } = meta.ride;

  const translate = useContext(TranslateContext);

  const seatLockEnabledRideStatuses = ['hidden', 'on_sale', 'archived'];
  const canLockSeat = (status) => {
      return seatLockEnabledRideStatuses.includes(status);
  };

  return (
      <div className="capacity">
          <div className="capacity__view">
              <Heading size={2}>Line { line_variation.line_id } { from.name } { to.name }</Heading>
            
              {rides.map((ride) => {
                  return <CapacityTable
                            key={`table-${ride.id}`}
                            info={ride}
                            rideId={ride.id}
                            rideUuid={ride.uuid}
                            timeline={timeline}
                            fetchTimeline={fetchTimeline}
                            canLockSeat={canLockSeat(rideStatus)} 
                            notify={notify}
                            translate={translate}
                        />;
              })}
          </div>
      </div>
  )
};

Capacity.propTypes = {
    // object contain main data
    meta: PropTypes.object.isRequired,
    // array contain timeline items data
    timeline: PropTypes.array.isRequired,
    // array contain rides data
    rides: PropTypes.array.isRequired,
    // method to request timeline data
    fetchTimeline: PropTypes.func,
    // global notify object
    notify: PropTypes.func,
};

Capacity.defaultProps = {
    meta: {},
    timeline: [],
    rides: [],
    fetchTimeline: () => {},
    notify: () => {},
};

