import { CTA, CTAProps } from '@interlay/ui';
import { useAccount } from 'wagmi';

type AuthCTAProps = CTAProps;

const AuthCTA = ({ onPress, onClick, disabled, children, type, ...props }: AuthCTAProps) => {
  const { address } = useAccount();

  const authProps = address
    ? { onPress, onClick, disabled, children, type, ...props }
    : { onPress: () => alert('implement'), children: 'Connect Wallet', ...props };

  return <CTA {...authProps} />;
};

export { AuthCTA };
