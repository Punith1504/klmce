SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname = 'students';
