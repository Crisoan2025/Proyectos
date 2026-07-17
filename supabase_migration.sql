--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3


ALTER TABLE IF EXISTS ONLY public.team_stats DROP CONSTRAINT IF EXISTS team_stats_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.team_stats DROP CONSTRAINT IF EXISTS team_stats_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.players DROP CONSTRAINT IF EXISTS players_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_visitor_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_season_id_fkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_local_team_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.teams DROP CONSTRAINT IF EXISTS teams_pkey;
ALTER TABLE IF EXISTS ONLY public.team_stats DROP CONSTRAINT IF EXISTS team_stats_team_id_season_id_key;
ALTER TABLE IF EXISTS ONLY public.team_stats DROP CONSTRAINT IF EXISTS team_stats_pkey;
ALTER TABLE IF EXISTS ONLY public.seasons DROP CONSTRAINT IF EXISTS seasons_pkey;
ALTER TABLE IF EXISTS ONLY public.players DROP CONSTRAINT IF EXISTS players_pkey;
ALTER TABLE IF EXISTS ONLY public.matches DROP CONSTRAINT IF EXISTS matches_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.teams ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.team_stats ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.seasons ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.players ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.matches ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.teams_id_seq;
DROP TABLE IF EXISTS public.teams;
DROP SEQUENCE IF EXISTS public.team_stats_id_seq;
DROP TABLE IF EXISTS public.team_stats;
DROP SEQUENCE IF EXISTS public.seasons_id_seq;
DROP TABLE IF EXISTS public.seasons;
DROP SEQUENCE IF EXISTS public.players_id_seq;
DROP TABLE IF EXISTS public.players;
DROP SEQUENCE IF EXISTS public.matches_id_seq;
DROP TABLE IF EXISTS public.matches;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    local_team_id integer,
    visitor_team_id integer,
    match_date timestamp without time zone NOT NULL,
    location character varying(100) NOT NULL,
    local_points integer DEFAULT 0,
    visitor_points integer DEFAULT 0,
    status character varying(20) DEFAULT 'pendiente'::character varying,
    match_time character varying(10) DEFAULT '20:00'::character varying,
    season_id integer,
    category character varying(20) DEFAULT 'Senior'::character varying
);



--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    surname character varying(100) NOT NULL,
    category character varying(50),
    team_id integer
);



--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seasons (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    start_date date,
    end_date date,
    is_active boolean DEFAULT true
);



--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seasons_id_seq OWNED BY public.seasons.id;


--
-- Name: team_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_stats (
    id integer NOT NULL,
    team_id integer,
    season_id integer,
    played integer DEFAULT 0,
    won integer DEFAULT 0,
    tied integer DEFAULT 0,
    lost integer DEFAULT 0,
    points integer DEFAULT 0,
    points_for integer DEFAULT 0,
    points_against integer DEFAULT 0
);



--
-- Name: team_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: team_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_stats_id_seq OWNED BY public.team_stats.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    coach_name character varying(100) NOT NULL,
    stadium character varying(255) DEFAULT 'Estadio Municipal'::character varying,
    category character varying(20) DEFAULT 'Senior'::character varying
);



--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'admin'::character varying
);



--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: seasons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasons ALTER COLUMN id SET DEFAULT nextval('public.seasons_id_seq'::regclass);


--
-- Name: team_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_stats ALTER COLUMN id SET DEFAULT nextval('public.team_stats_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.matches VALUES (3, 1, 2, '2026-05-10 20:00:00', 'Estadio Central', 90, 85, 'jugado', '20:00', 1, 'Senior');
INSERT INTO public.matches VALUES (4, 3, 9, '2026-04-23 00:00:00', 'Anastasio girardot', 7, 4, 'jugado', '22:00', 1, 'Senior');
INSERT INTO public.matches VALUES (5, 12, 13, '2026-05-16 00:00:00', 'Crypto Arena (Modificado)', 105, 98, 'jugado', '22:00', 1, 'Senior');
INSERT INTO public.matches VALUES (2, 1, 2, '2026-05-10 20:00:00', 'Estadio Central', 5, 13, 'jugado', '20:00', 1, 'Senior');
INSERT INTO public.matches VALUES (1, 1, 2, '2026-05-10 20:00:00', 'Estadio Central', 6, 20, 'jugado', '20:00', 1, 'Senior');
INSERT INTO public.matches VALUES (6, 3, 9, '2026-05-30 00:00:00', 'Estadio Municipal', 57, 98, 'jugado', '20:00', 1, 'Senior');
INSERT INTO public.matches VALUES (7, 7, 8, '2026-05-20 00:00:00', 'Estadio Municipal', 56, 87, 'jugado', '20:00', 1, 'Senior');
INSERT INTO public.matches VALUES (8, 1, 9, '2026-05-29 00:00:00', 'Estadio Municipal', 98, 77, 'jugado', '20:00', 1, 'Senior');


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.players VALUES (1, 'Cristian', 'Ortiz', 'sub 18', 1);
INSERT INTO public.players VALUES (3, 'Messi', 'Lewandowski', 'Sub 20', 2);
INSERT INTO public.players VALUES (4, 'Facundo', 'Campazzo', 'Senior', 1);
INSERT INTO public.players VALUES (6, 'Luis', 'Scola', 'Senior', 1);
INSERT INTO public.players VALUES (7, 'Nicolás', 'Laprovittola', 'Senior', 1);
INSERT INTO public.players VALUES (8, 'Marcos', 'Delía', 'Senior', 1);
INSERT INTO public.players VALUES (9, 'Luca', 'Vildoza', 'Junior', 1);
INSERT INTO public.players VALUES (10, 'Leandro', 'Bolmaro', 'Junior', 1);
INSERT INTO public.players VALUES (11, 'Juan', 'Fernández', 'Junior', 1);
INSERT INTO public.players VALUES (12, 'Carlos', 'Delfino', 'Senior', 2);
INSERT INTO public.players VALUES (13, 'Andrés', 'Nocioni', 'Senior', 2);
INSERT INTO public.players VALUES (14, 'Pablo', 'Prigioni', 'Senior', 2);
INSERT INTO public.players VALUES (15, 'Patricio', 'Garino', 'Senior', 2);
INSERT INTO public.players VALUES (16, 'Máximo', 'Fjellerup', 'Senior', 2);
INSERT INTO public.players VALUES (17, 'Santiago', 'Vaulet', 'Junior', 2);
INSERT INTO public.players VALUES (18, 'Francisco', 'Caffaro', 'Junior', 2);
INSERT INTO public.players VALUES (20, 'Emanuel', 'Ginóbili', 'Senior', 3);
INSERT INTO public.players VALUES (21, 'Rubén', 'Wolkowyski', 'Senior', 3);
INSERT INTO public.players VALUES (22, 'Diego', 'Osella', 'Senior', 3);
INSERT INTO public.players VALUES (23, 'Leonardo', 'Gutiérrez', 'Senior', 3);
INSERT INTO public.players VALUES (24, 'Marcelo', 'Milanesio', 'Senior', 3);
INSERT INTO public.players VALUES (26, 'Bruno', 'Caboclo', 'Junior', 3);
INSERT INTO public.players VALUES (27, 'Matías', 'Solanas', 'Junior', 3);
INSERT INTO public.players VALUES (28, 'Hernán', 'Montenegro', 'Senior', 5);
INSERT INTO public.players VALUES (29, 'Walter', 'Herrmann', 'Senior', 5);
INSERT INTO public.players VALUES (30, 'Alejandro', 'Montecchia', 'Senior', 5);
INSERT INTO public.players VALUES (31, 'Juan Ignacio', 'Sánchez', 'Senior', 5);
INSERT INTO public.players VALUES (32, 'Pepe', 'Sánchez', 'Senior', 5);
INSERT INTO public.players VALUES (33, 'Nicolás', 'Romano', 'Junior', 5);
INSERT INTO public.players VALUES (34, 'Martín', 'Cuello', 'Junior', 5);
INSERT INTO public.players VALUES (35, 'Joaquín', 'Valinotti', 'Junior', 5);
INSERT INTO public.players VALUES (36, 'Jaime', 'Echenique', 'Senior', 6);
INSERT INTO public.players VALUES (37, 'Braian', 'Angola', 'Senior', 6);
INSERT INTO public.players VALUES (38, 'Hansel', 'Pinto', 'Senior', 6);
INSERT INTO public.players VALUES (39, 'Juan', 'Palacios', 'Senior', 6);
INSERT INTO public.players VALUES (40, 'Jorge', 'Gutiérrez', 'Senior', 6);
INSERT INTO public.players VALUES (41, 'Sebastián', 'Herrera', 'Junior', 6);
INSERT INTO public.players VALUES (42, 'David', 'Flores', 'Junior', 6);
INSERT INTO public.players VALUES (43, 'Andrés', 'Ramírez', 'Junior', 6);
INSERT INTO public.players VALUES (44, 'Nikola', 'Mirotic', 'Senior', 7);
INSERT INTO public.players VALUES (45, 'Sertac', 'Sanli', 'Senior', 7);
INSERT INTO public.players VALUES (46, 'Nicolas', 'Laprovittola', 'Senior', 7);
INSERT INTO public.players VALUES (47, 'Cory', 'Higgins', 'Senior', 7);
INSERT INTO public.players VALUES (48, 'Alex', 'Abrines', 'Senior', 7);
INSERT INTO public.players VALUES (49, 'Jan', 'Vesely', 'Junior', 7);
INSERT INTO public.players VALUES (50, 'Ricky', 'Rubio', 'Junior', 7);
INSERT INTO public.players VALUES (51, 'Joel', 'Parra', 'Junior', 7);
INSERT INTO public.players VALUES (52, 'Sergio', 'Llull', 'Senior', 8);
INSERT INTO public.players VALUES (53, 'Rudy', 'Fernández', 'Senior', 8);
INSERT INTO public.players VALUES (54, 'Walter', 'Tavares', 'Senior', 8);
INSERT INTO public.players VALUES (55, 'Guerschon', 'Yabusele', 'Senior', 8);
INSERT INTO public.players VALUES (56, 'Mario', 'Hezonja', 'Senior', 8);
INSERT INTO public.players VALUES (57, 'Fabien', 'Causeur', 'Junior', 8);
INSERT INTO public.players VALUES (58, 'Carlos', 'Alocén', 'Junior', 8);
INSERT INTO public.players VALUES (59, 'Juan', 'Núñez', 'Junior', 8);
INSERT INTO public.players VALUES (60, 'Miguel', 'Rueda', 'Senior', 9);
INSERT INTO public.players VALUES (61, 'Óscar', 'Torres', 'Senior', 9);
INSERT INTO public.players VALUES (62, 'Luis', 'Montero', 'Senior', 9);
INSERT INTO public.players VALUES (63, 'Julián', 'Pesántez', 'Senior', 9);
INSERT INTO public.players VALUES (65, 'Kevin', 'Arboleda', 'Junior', 9);
INSERT INTO public.players VALUES (66, 'Camilo', 'Riascos', 'Junior', 9);
INSERT INTO public.players VALUES (67, 'Diego', 'Morales', 'Junior', 9);
INSERT INTO public.players VALUES (68, 'James', 'Johnson', 'Senior', 10);
INSERT INTO public.players VALUES (69, 'Marcus', 'Williams', 'Senior', 10);
INSERT INTO public.players VALUES (70, 'Oliver', 'Thompson', 'Senior', 10);
INSERT INTO public.players VALUES (71, 'Harry', 'Davies', 'Senior', 10);
INSERT INTO public.players VALUES (72, 'George', 'Wilson', 'Senior', 10);
INSERT INTO public.players VALUES (73, 'Thomas', 'Brown', 'Junior', 10);
INSERT INTO public.players VALUES (74, 'Jack', 'Taylor', 'Junior', 10);
INSERT INTO public.players VALUES (75, 'Charlie', 'Evans', 'Junior', 10);
INSERT INTO public.players VALUES (76, 'Fernando', 'Martínez', 'Senior', 11);
INSERT INTO public.players VALUES (77, 'Gastón', 'García', 'Senior', 11);
INSERT INTO public.players VALUES (78, 'Damián', 'Álvarez', 'Senior', 11);
INSERT INTO public.players VALUES (79, 'Rodrigo', 'López', 'Senior', 11);
INSERT INTO public.players VALUES (80, 'Ezequiel', 'Piñero', 'Senior', 11);
INSERT INTO public.players VALUES (81, 'Ignacio', 'Rivas', 'Junior', 11);
INSERT INTO public.players VALUES (82, 'Valentín', 'Herrera', 'Junior', 11);
INSERT INTO public.players VALUES (83, 'Thiago', 'Domínguez', 'Junior', 11);
INSERT INTO public.players VALUES (84, 'LeBron', 'James', 'Senior', 12);
INSERT INTO public.players VALUES (85, 'Anthony', 'Davis', 'Senior', 12);
INSERT INTO public.players VALUES (86, 'Russell', 'Westbrook', 'Senior', 12);
INSERT INTO public.players VALUES (87, 'Austin', 'Reaves', 'Senior', 12);
INSERT INTO public.players VALUES (88, 'Rui', 'Hachimura', 'Senior', 12);
INSERT INTO public.players VALUES (89, 'Max', 'Christie', 'Junior', 12);
INSERT INTO public.players VALUES (90, 'Jalen', 'Hood-Schifino', 'Junior', 12);
INSERT INTO public.players VALUES (91, 'Dalton', 'Knecht', 'Junior', 12);
INSERT INTO public.players VALUES (92, 'Camilo', 'Rodríguez', 'Senior', 13);
INSERT INTO public.players VALUES (93, 'Mateo', 'Valencia', 'Senior', 13);
INSERT INTO public.players VALUES (94, 'Santiago', 'Ospina', 'Senior', 13);
INSERT INTO public.players VALUES (95, 'Daniel', 'Zapata', 'Senior', 13);
INSERT INTO public.players VALUES (96, 'Esteban', 'Muñoz', 'Senior', 13);
INSERT INTO public.players VALUES (97, 'Simón', 'Arias', 'Junior', 13);
INSERT INTO public.players VALUES (98, 'Tomás', 'Betancur', 'Junior', 13);
INSERT INTO public.players VALUES (99, 'Samuel', 'Londoño', 'Junior', 13);
INSERT INTO public.players VALUES (64, 'Cristian', 'Ortiz', 'sub 18', 1);
INSERT INTO public.players VALUES (25, 'Tyler', 'creator', 'sub 20', 3);
INSERT INTO public.players VALUES (101, 'Joao', 'cancelo', 'Sub 20', 5);
INSERT INTO public.players VALUES (102, 'Axel', 'Rose', 'Junior', 16);


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.seasons VALUES (1, 'Temporada 2026', '2026-01-01', '2026-12-31', false);
INSERT INTO public.seasons VALUES (2, 'Temporada 27-28', NULL, NULL, true);


--
-- Data for Name: team_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.team_stats VALUES (1, 6, 1, 0, 0, 0, 0, 2, 0, 0);
INSERT INTO public.team_stats VALUES (4, 10, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (5, 11, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (8, 12, 1, 1, 1, 0, 0, 3, 105, 98);
INSERT INTO public.team_stats VALUES (9, 13, 1, 1, 0, 0, 1, 0, 98, 105);
INSERT INTO public.team_stats VALUES (11, 5, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (12, 14, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (13, 15, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (14, 2, 1, 3, 2, 0, 1, 14, 118, 101);
INSERT INTO public.team_stats VALUES (15, 16, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (6, 3, 1, 2, 1, 0, 1, 15, 64, 102);
INSERT INTO public.team_stats VALUES (16, 17, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (17, 18, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (2, 7, 1, 1, 0, 0, 1, 6, 56, 87);
INSERT INTO public.team_stats VALUES (3, 8, 1, 1, 1, 0, 0, 8, 87, 56);
INSERT INTO public.team_stats VALUES (10, 1, 1, 4, 2, 0, 2, 16, 199, 195);
INSERT INTO public.team_stats VALUES (7, 9, 1, 3, 1, 0, 2, 9, 179, 162);
INSERT INTO public.team_stats VALUES (18, 12, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (19, 13, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (20, 5, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (21, 14, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (22, 15, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (23, 2, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (24, 16, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (25, 17, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (26, 18, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (27, 6, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (28, 7, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (29, 8, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (30, 10, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (31, 11, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (32, 3, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (33, 9, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO public.team_stats VALUES (34, 1, 2, 0, 0, 0, 0, 0, 0, 0);


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.teams VALUES (12, 'Los Angeles Rockets', 'Gamero', 'Campin', 'Senior');
INSERT INTO public.teams VALUES (13, 'Bulls de Medellin', 'Mondragon', 'Ditaires', 'Senior');
INSERT INTO public.teams VALUES (5, 'Alianza Petrolera', 'Popeye', 'Maracana', 'Senior');
INSERT INTO public.teams VALUES (14, 'Millonarios', 'Rafael', 'Plaza mayor', 'Senior');
INSERT INTO public.teams VALUES (15, 'Millonarios', 'Rafael', 'Plaza mayor', 'Senior');
INSERT INTO public.teams VALUES (2, 'Alianza Pa', 'Popeye', 'Maracana', 'Senior');
INSERT INTO public.teams VALUES (16, 'Atalanta', 'Deossa', 'Estadio Atalanta', 'Junior');
INSERT INTO public.teams VALUES (17, 'Deportivo pasto', 'jerry mina', 'Estadio Deportivo pasto', 'Senior');
INSERT INTO public.teams VALUES (18, 'Tolima', 'Gonzalo', 'Estadio Tolima', 'Senior');
INSERT INTO public.teams VALUES (6, 'atletico nacional', 'messi', 'Coliseo El Salitre (Bogotá)', 'Senior');
INSERT INTO public.teams VALUES (7, 'Barcelona', 'Xavi', 'Coliseo Iván de Bedout (Medellín)', 'Senior');
INSERT INTO public.teams VALUES (8, 'Real Madrid', 'Musolinni', 'Coliseo Evangelista Mora (Cali)', 'Senior');
INSERT INTO public.teams VALUES (10, 'Manchester city', 'pep guardiola', 'Coliseo Bicentenario (Bucaramanga)', 'Senior');
INSERT INTO public.teams VALUES (11, 'Internacional de buenos aires', 'Valderrama', 'Coliseo Toto Hernández (Cúcuta)', 'Senior');
INSERT INTO public.teams VALUES (3, 'Halcones de la Costa', 'Pérez', 'Coliseo Álvaro Mesa Amaya (Villavicencio)', 'Senior');
INSERT INTO public.teams VALUES (9, 'America de cali', 'Guardiola', 'Coliseo Bernardo Caraballo (Cartagena)', 'Senior');
INSERT INTO public.teams VALUES (1, 'Lions de Buenos Aires', 'García', 'Coliseo Ginés Arturo Álvarez (Quibdó)', 'Senior');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (5, 'cristian61020@gmail.com', '$2b$10$FYOIKeD1nsieU0fZeLF/XuSsHlXIGAkyJatteI2x9ZYad.Cbk4L3O', 'admin');
INSERT INTO public.users VALUES (6, 'admin@liga.com', '$2b$10$hmIGb5svnm59escnouJ43O3bG/QWh/HJuTOflSRU3Qb8LDgCxdiyG', 'admin');
INSERT INTO public.users VALUES (9, 'Cristian6102061020@gmail.com', '$2b$10$2bpRn3TFcmCnWqE2bsK8Rezz9SorB5M.YWIAXuoRW3MAnsezb.yzG', 'admin');


--
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.matches_id_seq', 8, true);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 102, true);


--
-- Name: seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seasons_id_seq', 2, true);


--
-- Name: team_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_stats_id_seq', 34, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 18, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: team_stats team_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_stats
    ADD CONSTRAINT team_stats_pkey PRIMARY KEY (id);


--
-- Name: team_stats team_stats_team_id_season_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_stats
    ADD CONSTRAINT team_stats_team_id_season_id_key UNIQUE (team_id, season_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: matches matches_local_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_local_team_id_fkey FOREIGN KEY (local_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: matches matches_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: matches matches_visitor_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_visitor_team_id_fkey FOREIGN KEY (visitor_team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_stats team_stats_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_stats
    ADD CONSTRAINT team_stats_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;


--
-- Name: team_stats team_stats_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_stats
    ADD CONSTRAINT team_stats_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



--
-- Migración 002 — Soporte de imágenes (logos de liga/equipos, fotos de jugadores)
-- Aditiva e idempotente. Mantener en sync con backend/migrations/002_images.sql
--
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.teams   ADD COLUMN IF NOT EXISTS logo_url  TEXT;

CREATE TABLE IF NOT EXISTS public.settings (
    id              integer PRIMARY KEY DEFAULT 1,
    league_name     varchar(100) DEFAULT 'Liga TPO',
    league_logo_url TEXT,
    CONSTRAINT settings_singleton CHECK (id = 1)
);
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
