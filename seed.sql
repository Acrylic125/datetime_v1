CREATE TABLE public.accounts (
	id INT8 NOT NULL DEFAULT unique_rowid(),
	compound_id VARCHAR(255) NOT NULL,
	user_id INT8 NOT NULL,
	provider_type VARCHAR(255) NOT NULL,
	provider_id VARCHAR(255) NOT NULL,
	provider_account_id VARCHAR(255) NOT NULL,
	refresh_token STRING NULL,
	access_token STRING NULL,
	access_token_expires TIMESTAMPTZ NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT accounts_pkey PRIMARY KEY (id ASC),
	UNIQUE INDEX compound_id (compound_id ASC),
	INDEX provider_account_id (provider_account_id ASC),
	INDEX provider_id (provider_id ASC),
	INDEX user_id (user_id ASC)
);
CREATE TABLE public.sessions (
	id INT8 NOT NULL DEFAULT unique_rowid(),
	user_id INT8 NOT NULL,
	expires TIMESTAMPTZ NOT NULL,
	session_token VARCHAR(255) NOT NULL,
	access_token VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT sessions_pkey PRIMARY KEY (id ASC),
	UNIQUE INDEX session_token (session_token ASC),
	UNIQUE INDEX access_token (access_token ASC)
);
CREATE TABLE public.users (
	id INT8 NOT NULL DEFAULT unique_rowid(),
	name VARCHAR(255) NULL,
	email VARCHAR(255) NULL,
	email_verified TIMESTAMPTZ NULL,
	image STRING NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT users_pkey PRIMARY KEY (id ASC),
	UNIQUE INDEX email (email ASC)
);
CREATE TABLE public.verification_requests (
	id INT8 NOT NULL DEFAULT unique_rowid(),
	identifier VARCHAR(255) NOT NULL,
	token VARCHAR(255) NOT NULL,
	expires TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT verification_requests_pkey PRIMARY KEY (id ASC),
	UNIQUE INDEX token (token ASC)
);
CREATE TABLE public.expenses (
	id UUID NOT NULL DEFAULT gen_random_uuid(),
	title VARCHAR(255) NOT NULL,
	amount DECIMAL(7,2) NOT NULL,
	happened_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT expenses_pkey PRIMARY KEY (id ASC)
);
CREATE TABLE public.expense_files (
	id UUID NOT NULL DEFAULT gen_random_uuid(),
	expense_id UUID NULL,
	original_filename VARCHAR(250) NOT NULL,
	mimetype VARCHAR(50) NOT NULL,
	public_id VARCHAR(255) NOT NULL,
	width INT8 NULL,
	height INT8 NULL,
	url VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT current_timestamp():::TIMESTAMPTZ,
	CONSTRAINT expense_files_pkey PRIMARY KEY (id ASC),
	UNIQUE INDEX expense_files_public_id_key (public_id ASC)
);
ALTER TABLE public.expense_files ADD CONSTRAINT fk_expense_files_expenses FOREIGN KEY (expense_id) REFERENCES public.expenses(id);
ALTER TABLE public.expense_files VALIDATE CONSTRAINT fk_expense_files_expenses;
