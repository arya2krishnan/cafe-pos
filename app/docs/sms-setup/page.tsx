'use client';
import { Box, Typography, Card, CardContent, Chip, Divider, Stack } from '@mui/joy';
import NextLink from 'next/link';
import Link from '@mui/joy/Link';

const steps = [
  {
    n: 1,
    title: 'Create a free Twilio account',
    body: (
      <>
        Go to{' '}
        <Link href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">
          twilio.com/try-twilio
        </Link>{' '}
        and sign up. Verify your email and phone number when prompted. You get ~$15 in free credit automatically -- no card needed yet.
      </>
    ),
  },
  {
    n: 2,
    title: 'Upgrade from trial mode',
    body: (
      <>
        Trial accounts can only text numbers you manually verify, which means your customers won&apos;t receive messages.
        Click <strong>Upgrade</strong> in the Twilio Console header and add a credit card.
        You are NOT charged immediately -- your $15 free credit is used first. At ~$0.008/SMS and $1/month for a number,
        that covers most home cafes for months.
      </>
    ),
  },
  {
    n: 3,
    title: 'Buy a phone number',
    body: (
      <>
        In the Twilio Console, go to <strong>Phone Numbers &rarr; Manage &rarr; Buy a number</strong>.
        Search for a local number in your area code and click Buy. It costs $1/month, charged from your credit balance.
      </>
    ),
  },
  {
    n: 4,
    title: 'Find your credentials',
    body: (
      <>
        Go to the <strong>Twilio Console Dashboard</strong> (the home page after login).
        You&apos;ll see three values you need:
        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
          <li><strong>Account SID</strong> -- starts with <code>AC</code></li>
          <li><strong>Auth Token</strong> -- click the eye icon to reveal it</li>
          <li><strong>Phone Number</strong> -- the number you just bought, in +1XXXXXXXXXX format</li>
        </Box>
      </>
    ),
  },
  {
    n: 5,
    title: 'Paste them into your cafe settings',
    body: (
      <>
        In your HomeCafe POS dashboard, go to <strong>Settings &rarr; SMS credentials</strong>
        and paste in all three values. Hit Save. That&apos;s it -- your customers will now receive
        order-ready texts from your own number.
      </>
    ),
  },
];

export default function SmsSetupPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.body', px: { xs: 2, md: 4 }, py: 6 }}>
      <Box sx={{ maxWidth: 680, mx: 'auto' }}>
        <Link component={NextLink} href="/" sx={{ fontSize: 'sm', mb: 3, display: 'inline-block' }}>
          &larr; Back to HomeCafe POS
        </Link>

        <Typography level="h1" sx={{ mb: 1 }}>Setting up SMS notifications</Typography>
        <Typography level="body-lg" sx={{ color: 'text.secondary', mb: 4 }}>
          Let your customers know when their order is ready with an automated text message.
          Takes about 5 minutes to set up using a free Twilio account.
        </Typography>

        <Card variant="soft" color="primary" sx={{ mb: 4 }}>
          <CardContent>
            <Typography level="title-md">How much does it cost?</Typography>
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              Twilio gives you ~$15 free credit on signup. A phone number is $1/month and each SMS is ~$0.008.
              For a home cafe doing 30 orders on a weekend with 50% SMS opt-in, that&apos;s about $1.50/month -- and
              the free credit covers the first several months.
            </Typography>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          {steps.map((step, i) => (
            <Box key={step.n}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Chip
                  variant="solid"
                  color="primary"
                  size="lg"
                  sx={{ mt: 0.25, minWidth: 32, height: 32, borderRadius: '50%', fontWeight: 'bold', flexShrink: 0 }}
                >
                  {step.n}
                </Chip>
                <Box>
                  <Typography level="title-lg" sx={{ mb: 0.5 }}>{step.title}</Typography>
                  <Typography component="div" level="body-md" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {step.body}
                  </Typography>
                </Box>
              </Box>
              {i < steps.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </Stack>

        <Card variant="outlined" sx={{ mt: 4 }}>
          <CardContent>
            <Typography level="title-md" sx={{ mb: 0.5 }}>Need help?</Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Twilio&apos;s own docs are at{' '}
              <Link href="https://www.twilio.com/docs/sms/quickstart" target="_blank" rel="noopener noreferrer">
                twilio.com/docs/sms/quickstart
              </Link>
              . If something isn&apos;t working, double-check that your Auth Token is correct (it resets if you click
              the refresh icon in the Twilio Console) and that your phone number is in +1XXXXXXXXXX format.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
