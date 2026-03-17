import React, { JSX } from 'react'
import ContentContainer from './ui/layouts/ContentContainer'
import { ContactFooter, FooterLinksContent } from '@/const/const'
import Link from 'next/link'
import { FacebookIcon, InstagramIcon, PinterestIcon, TwitterIcon } from './icon';
import Image from 'next/image';

const iconMap: Record<string, JSX.Element> = {
  facebook: <FacebookIcon size={20} color='black' />,
  instagram: <InstagramIcon size={20} color='black' />,
  pinterest: <PinterestIcon size={20} color='black' />,
  twitter: <TwitterIcon size={20} color='black' />,
};

const SocialMediaIcon = ({ name }: { name: string }) => {
  return iconMap[name] || null;
};

const Copyright = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-[250px] md:w-[300px] xl:w-[460px] h-fit flex flex-col items-center gap-[20px]">
        <div className="bg-center bg-cover relative w-full h-[223px]">
          <Image src={'/image/footer_img.png'} alt='footer-image' fill />
        </div>
        <div className="flex items-center gap-[15px]">
          <Link href={'#'}><img src='/svg/icon-playstore.svg' alt='playstore-icon' /></Link>
          <Link href={'#'}><img src='/svg/icon-appstore.svg' alt='playstore-icon' /></Link>
        </div>
        <span className='text-[1rem]'>© 2024 - 2025, PT. Tokonyadia.</span>
      </div>
    </div>
  )
}

const ContactAndSecurity = () => {
  return (
    <div className="flex flex-col gap-3.75 items-start">
      {/* Keamanan & Privasi */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-bold capitalize text-[1rem]">keamanan & privasi</h1>
        <div className="flex items-center gap-2.5">
          <Image src={'/image/icon_pci_license.webp'} height={48} width={70} alt='pci-license' />
          <Image src={'/image/icon_bsi_license_hd.png'} height={48} width={70} alt='bsi-license' />
          <Image src={'/image/icon_bsi_license_hd.png'} height={48} width={70} alt='bsi-license' />
        </div>
      </div>

      {/* Ikuti Kami */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-bold capitalize text-[1rem]">ikuti kami</h1>
        <div className="flex items-center gap-2.5">
          {ContactFooter.map((item: any) => (
            <Link key={item?.label} href={item?.link}>
              <SocialMediaIcon name={item?.label} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

const FooterLinks = () => {
  return (
    <div className="flex items-start gap-4">
      {/* Kolom pertama */}
      <div>
        <h1 className="font-bold capitalize text-[1rem]">
          {FooterLinksContent[0]?.title}
        </h1>
        <div className="flex flex-col gap-2.5 items-start mt-2">
          {FooterLinksContent[0]?.links.map((item: any) => (
            <Link
              key={item?.label}
              href={item?.link}
              className="hover:text-primaryGreen text-[.9rem] text-gray-700"
            >
              {item?.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Kolom kedua & ketiga */}
      <div className="flex flex-col gap-3.75 items-start">
        {FooterLinksContent?.slice(1, 3)?.map((item: any) => (
          <div key={item?.title}>
            <h1 className="font-bold capitalize text-[1rem]">
              {item?.title}
            </h1>
            <div className="flex flex-col gap-2.5 items-start mt-2">
              {item?.links.map((item: any) => (
                <Link
                  key={item?.label}
                  href={item?.link}
                  className="hover:text-primaryGreen text-[.9rem] text-gray-700"
                >
                  {item?.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Footer = () => {
  return (
    <footer className='w-full bg-white'>
      <ContentContainer>
        <div className="flex flex-col lg:flex-row gap-7.5 lg:gap-0 justify-between">
          <FooterLinks />

          <div className="flex flex-col gap-5 md:gap-0 justify-between lg:justify-start md:flex-row">
            {/* keamanan dan contact */}
            <ContactAndSecurity />

            {/* copyright sections */}
            <Copyright />
          </div>
        </div>
      </ContentContainer>
    </footer>
  )
}

export default Footer