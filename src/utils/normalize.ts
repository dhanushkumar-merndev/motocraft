export function inferDepartment(
  position: string | null | undefined,
): string | null {
  switch (position) {
    case 'sales_manager':
    case 'sales_executive':
    case 'test_rider':
    case 'receptionist':
      return 'Sales';
    case 'service_manager':
    case 'service_advisor':
    case 'technician':
      return 'Service';
    case 'parts_manager':
    case 'parts_supervisor':
      return 'Parts & Accessories';
    default:
      return null;
  }
}
