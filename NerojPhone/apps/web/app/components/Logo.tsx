import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    variant?: 'navbar' | 'footer';
}

export default function Logo({ size = 'md', showText = true, variant = 'navbar' }: LogoProps) {
    const sizes = {
        sm: { height: 40, width: 110 },
        md: { height: 60, width: 200 },
        lg: { height: 80, width: 280 },
    };

    const sizeConfig = sizes[size];

    return (
        <Link href="/" className="flex items-center group h-full">
            <div className={`relative h-full flex items-center transition-transform group-hover:scale-105 ${variant === 'navbar' ? 'mix-blend-screen opacity-100' : ''
                }`}>
                <Image
                    src="/images/logo-v2.jpg"
                    alt="NerojPhone Logo"
                    width={sizeConfig.width}
                    height={sizeConfig.height}
                    className={`object-contain rounded-2xl ${variant === 'navbar' ? 'max-h-16 w-auto' : 'max-h-20 w-auto'}`}
                    style={{ height: 'auto' }}
                    priority
                />
            </div>
        </Link>
    );
}
