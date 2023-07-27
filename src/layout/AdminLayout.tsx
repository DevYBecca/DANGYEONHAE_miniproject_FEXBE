import { Outlet } from 'react-router-dom'
import SideBar from '@/component/SideBar'

const AdminLayout = () => {
  return (
    <div style={{ display: "flex", width:"100%" }}>
      <SideBar />
      <div style={{ marginLeft: "270px", width: "100%" }}>
        <Outlet />
      </div>
    </div>
  )
}
export default AdminLayout