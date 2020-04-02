import { formatTime } from '../../util/tools';

export default function() {
    return function (val, e) {
        const hourParticles = e.col.colDef.hourParticles;
        return hourParticles === 60 ? val : formatTime(val, 'yyyy-MM-dd');
    }
}