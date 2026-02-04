import { useEffect } from 'react';
import { useSchedulerNavigation } from './SchedulerNavigationContext';

// This component should be placed in whatever renders your tabs
// You'll import and use it there
const TabSwitchListener = ({ onSwitchTab }) => {
    const { activeParentTab, activeChildTab } = useSchedulerNavigation();

    useEffect(() => {
        if (activeParentTab && activeChildTab && onSwitchTab) {
            console.log('Switching tabs:', { parent: activeParentTab, child: activeChildTab });
            onSwitchTab(activeParentTab, activeChildTab);
        }
    }, [activeParentTab, activeChildTab, onSwitchTab]);

    return null;
};

export default TabSwitchListener;