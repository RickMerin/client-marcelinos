import { MaintenanceLayoutView } from "./maintenance/MaintenanceLayouts";
import type { MaintenanceContentProps } from "./maintenance/maintenanceUi";

type MaintenanceModeProps = MaintenanceContentProps & { variant: string };

const MaintenanceMode = ({ variant, ...content }: MaintenanceModeProps) => {
  return <MaintenanceLayoutView variant={variant} {...content} />;
};

export default MaintenanceMode;
