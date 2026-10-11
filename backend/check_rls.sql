SELECT tablename, policyname, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'students';
