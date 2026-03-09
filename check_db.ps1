$env:PGPASSWORD = "Paravoz12"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d cgm_dashboard -c "SELECT COUNT(*) FROM purchases;" 2>&1
