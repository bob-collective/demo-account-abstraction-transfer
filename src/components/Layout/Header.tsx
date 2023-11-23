import { Flex } from '@interlay/ui';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Badge } from '../Badge';
import { Faucet } from '../Faucet';
import { GasFaucet } from '../GasFaucet';
import { CTAWrapper, StyledHeader } from './Layout.styles';

const Header = () => {
  const { address } = useAccount();

  return (
    <StyledHeader elementType='header' alignItems='center' justifyContent='space-between'>
      <Flex>
        <a href='/' aria-label='navigate to home page'>
          <img
            src='https://uploads-ssl.webflow.com/64e85c2f3609488b3ed725f4/64ede4ad095a0a3801df095f_BobLogo.svg'
            width='137'
            alt='logo'
          />
        </a>
        <Badge />
      </Flex>
      <CTAWrapper>
        {address && (
          <>
            <Faucet />
            <GasFaucet />
          </>
        )}
        {/* <CTA disabled={isConnecting} size='small' onClick={() => open()}>
          {address ? (
            <Flex elementType='span' gap='spacing2'>
              <Jazzicon diameter={20} seed={jsNumberForAddress(address)} />
              <Span style={{ color: 'inherit' }} size='s' color='tertiary'>
                {truncateEthAddress(address)}
              </Span>
            </Flex>
          ) : (
            'Connect Wallet'
          )}
        </CTA> */}
        <ConnectButton />
      </CTAWrapper>
    </StyledHeader>
  );
};

export { Header };
