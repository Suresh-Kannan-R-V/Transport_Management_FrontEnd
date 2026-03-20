| Code | Status             | Description                                                    |
| ---- | ------------------ | -------------------------------------------------------------- |
| 1    | PENDING            | Route created by faculty. Awaiting vehicle assignment.         |
| 2    | VEHICLE_ASSIGNED   | Vehicle assigned by admin. Awaiting faculty approval.          |
| 3    | VEHICLE_REASSIGNED | Vehicle reassigned due to faculty rejection.                   |
| 4    | VEHICLE_APPROVED   | Faculty approved assigned vehicle. Awaiting driver assignment. |
| 5    | DRIVER_ASSIGNED    | Driver assigned by admin. Awaiting trip start.                 |
| 6    | DRIVER_REASSIGNED  | Driver reassigned due to unavailability/emergency.             |
| 7    | STARTED            | Faculty provided start OTP. Trip started.                      |
| 8    | COMPLETED          | Admin provided end OTP. Trip completed successfully.           |
| 9    | CANCELLED          | Route cancelled by faculty.                                    |

(PENDING → VEHICLE_ASSIGNED → VEHICLE_APPROVED → DRIVER_ASSIGNED → STARTED → COMPLETED)


| Route                       | Admin | Faculty | Driver |
| --------------------------- | ----- | ------- | ------ |
| dashboard                   | ✅     | ✅       | ✅      |
| assignment                  | ❌     | ✅       | ❌      |
| driver/:driverId            | ✅     | ❌       | ✅      |
| mission                     | ✅     | ✅       | ❌      |
| request                     | ✅     | ❌       | ❌      |
| request/new-request         | ✅     | ✅       | ❌      |
| request/view-request/:id    | ✅     | ✅       | ❌      |
| mission/view-request/:id    | ✅     | ✅       | ❌      |
| schedule                    | ✅     | ❌       | ✅      |
| schedule/create-leave       | ✅     | ❌       | ✅      |
| settings                    | ✅     | ❌       | ❌      |
| settings/add-users          | ✅     | ❌       | ❌      |
| settings/vehicle-management | ✅     | ❌       | ❌      |
| settings/driver-management  | ✅     | ❌       | ❌      |
| settings/session-management | ✅     | ❌       | ❌      |


Transport Admin / Faculty
        │
        │ generate start OTP
        ▼
Driver enters OTP
        │
        ▼
Route → STARTED
Driver → ON_TRIP
        │
        │ Trip completed
        ▼
Admin generates END OTP
        │
        ▼
Driver enters OTP
        │
        ▼
Route → COMPLETED
Driver → AVAILABLE
