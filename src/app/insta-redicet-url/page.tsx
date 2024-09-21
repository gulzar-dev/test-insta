import { useRouter } from 'next/router';

export default function IntaRedirectUrl() {
  const router = useRouter();
  const { code, error, error_reason, error_description } = router.query;
  const insta_base_url = "https://api.instagram.com/oauth/access_token"

  return (
    <div>
      The code parameter is: {code}
    </div>
  );
}