from flask_restx import reqparse

translate_args = reqparse.RequestParser()
translate_args.add_argument('srcLanguage', type=str, help="Source Language missing", required=True)
translate_args.add_argument('targetLanguage', type=str, help="Target Language missing", required=True)
translate_args.add_argument('text', type=str, help="Text to translate missing", required=True)

detect_lang_args = reqparse.RequestParser()
detect_lang_args.add_argument('text_to_detect_lang', type=str, help="Text to detect language for", required=True)

get_translations_args = reqparse.RequestParser()
get_translations_args.add_argument('source_lang', type=str, help="Source language name or ISO code")
get_translations_args.add_argument('target_lang', type=str, help="Target language name or ISO code")
get_translations_args.add_argument('status', type=str, help="Translation status (pending, needs_review, verified)")
get_translations_args.add_argument('domain', type=str, help="Translation domain")
get_translations_args.add_argument('limit', type=int, help="Number of translations to return (use -1 for all)", default=200)
get_translations_args.add_argument('offset', type=int, help="Number of translations to skip", default=0)
get_translations_args.add_argument('search', type=str, help="Search term for source or target text")
get_translations_args.add_argument('after_id', type=int, help="Return results after this translation ID (for keyset pagination)")
get_translations_args.add_argument('created_at_start', type=str, help="Start date (ISO8601) for created_at filter")
get_translations_args.add_argument('created_at_end', type=str, help="End date (ISO8601) for created_at filter")

login_args = reqparse.RequestParser()
login_args.add_argument('username', type=str, help="Username", required=True)
login_args.add_argument('password', type=str, help="Password", required=True) 