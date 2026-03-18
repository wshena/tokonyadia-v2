import MainContainer from "@/components/ui/layouts/MainContainer"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainContainer>
      <Navbar />
      {children}
      <Footer />
    </MainContainer>
  )
}