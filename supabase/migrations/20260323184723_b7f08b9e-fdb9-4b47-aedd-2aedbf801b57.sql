DROP POLICY IF EXISTS "Users can read their own submissions" ON quiz_submissions;
CREATE POLICY "Admins can read all quiz submissions"
  ON quiz_submissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));