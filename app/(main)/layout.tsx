import MainContainer from "@/components/ui/layouts/MainContainer"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AuthSessionSync from "@/components/auth/AuthSessionSync"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainContainer>
      <AuthSessionSync />
      <Navbar />
      {children}
      <Footer />
    </MainContainer>
  )
}
